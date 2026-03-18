import { pool } from "../db.js";

async function getUserBalance(userId) {
  const { rows } = await pool.query(
    'SELECT balance_ferias as ferias, balance_day_off as day_off FROM users WHERE id = $1',
    [userId]
  );
  return rows[0];
}

async function updateUserBalance(userId, type, days) {
  const columnMap = {
    'ferias': 'balance_ferias',
    'day-off': 'balance_day_off'
  };

  const column = columnMap[type];
  if (!column) {
    throw new Error('Tipo de requisição inválido');
  }

  await pool.query(
    `UPDATE users SET ${column} = ${column} - $1 WHERE id = $2`,
    [days, userId]
  );
}

async function restoreUserBalance(userId, type, days) {
  const columnMap = {
    'ferias': 'balance_ferias',
    'day-off': 'balance_day_off'
  };

  const column = columnMap[type];
  if (!column) {
    throw new Error('Tipo de requisição inválido');
  }

  await pool.query(
    `UPDATE users SET ${column} = ${column} + $1 WHERE id = $2`,
    [days, userId]
  );
}

export default async function requestsRoutes(server) {
  server.get("/", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
          },
          type: { type: "string", enum: ["ferias", "day-off"] },
          from: { type: "string", format: "date" },
          to: { type: "string", format: "date" },
        },
      },
    },
  },
    async (request, reply) => {
      if (!request.user?.id) {
        return reply.status(401).send({ message: "Usuário não autenticado" });
      }

      const userId = request.user.id;
      const { status, type, from, to } = request.query;

      const query = `
      SELECT id, type, start_date, end_date, status
      FROM requests
      WHERE user_id = $1
        AND ($2::text IS NULL OR status = $2)
        AND ($3::text IS NULL OR type = $3)
        AND ($4::date IS NULL OR start_date >= $4)
        AND ($5::date IS NULL OR end_date <= $5)
      ORDER BY created_at DESC
    `;

      const values = [
        userId,
        status ?? null,
        type ?? null,
        from ?? null,
        to ?? null,
      ];

      const { rows } = await pool.query(query, values);

      return {
        total: rows.length,
        data: rows,
      };
    },
  );

  server.post("/", {
    schema: {
      body: {
        type: "object",
        required: ["type", "startDate", "endDate"],
        properties: {
          type: { type: "string", enum: ["ferias", "day-off"] },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
        },
      },
    },
  },
    async (request, reply) => {
      const { type, startDate, endDate } = request.body;

      if (new Date(endDate) < new Date(startDate)) {
        return reply
          .status(400)
          .send({ message: "endDate não pode ser antes de startDate" });
      }

      const diffInDays = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

      if (type === "ferias") {
        if (diffInDays > 30) {
          return reply
            .status(400)
            .send({ message: "A diferença entre as datas deve ser de no máximo 30 dias" });
        }
      }

      if (type === "day-off") {
        if (diffInDays > 10) {
          return reply
            .status(400)
            .send({ message: "A diferença entre as datas deve ser de no máximo 10 dias" });
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(startDate + 'T00:00:00');

      if (start < today) {
        return reply
          .status(400)
          .send({ message: "A data de início não pode ser no passado" });
      }

      if (!request.user?.id) {
        return reply.status(401).send({ message: "Usuário não autenticado" });
      }

      const userId = request.user.id;

      if (type === "ferias") {
        const balance = await getUserBalance(userId);
        const daysNeeded = diffInDays + 1;

        if (balance.ferias < daysNeeded) {
          return reply
            .status(400)
            .send({ message: `Saldo de férias insuficiente. Você tem ${balance.ferias} dias disponíveis, mas precisa de ${daysNeeded} dias.` });
        }
      }

      if (type === "day-off") {
        const balance = await getUserBalance(userId);
        const daysNeeded = diffInDays + 1;

        if (balance.day_off < daysNeeded) {
          return reply
            .status(400)
            .send({ message: `Saldo de day-off insuficiente. Você tem ${balance.day_off} dias disponíveis, mas precisa de ${daysNeeded} dias.` });
        }
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const insertRequest = `
        INSERT INTO requests (user_id, type, start_date, end_date, status)
        VALUES ($1, $2, $3, $4, 'DRAFT')
        RETURNING id, type, start_date, end_date, status
      `;

        const { rows } = await client.query(insertRequest, [
          userId,
          type,
          startDate,
          endDate,
        ]);

        const requestCreated = rows[0];

        const insertHistory = `
        INSERT INTO requests_history (request_id, status, changed_by)
        VALUES ($1, 'DRAFT', $2)
      `;

        await client.query(insertHistory, [requestCreated.id, userId]);

        await client.query("COMMIT");

        return reply.status(201).send(requestCreated);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  );

  server.get('/:id', async (request, reply) => {
    if (!request.user?.id) {
      return reply.status(401).send({ message: 'Usuário não autenticado' });
    }

    const { id } = request.params;
    const userId = request.user.id;

    const query = `
      SELECT 
        r.id,
        r.type,
        r.start_date,
        r.end_date,
        r.status,
        r.created_at,
        u.id as user_id,
        u.nome,
        u.email,
        u.role
      FROM requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1 AND r.user_id = $2
    `;

    const { rows } = await pool.query(query, [id, userId]);

    if (rows.length === 0) {
      return reply.status(404).send({ message: 'Requisição não encontrada' });
    }

    return rows[0];
  });

  server.get('/:id/history', async (request, reply) => {
    const { id } = request.params;

    const query = `
      SELECT 
        rh.id,
        rh.request_id,
        rh.status,
        rh.created_at,
        u.id as user_id,
        u.nome as changed_by_user,
        u.email as user_email
      FROM requests_history rh
      LEFT JOIN users u ON rh.changed_by = u.id
      WHERE rh.request_id = $1
      ORDER BY rh.created_at DESC
    `;

    const { rows } = await pool.query(query, [id]);

    return {
      request_id: id,
      total: rows.length,
      history: rows
    };
  });

  server.put('/:id', {
    schema: {
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'] },
          type: { type: 'string', enum: ['ferias', 'day-off'] },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      }
    }
  }, async (request, reply) => {
    if (!request.user?.id) {
      return reply.status(401).send({ message: 'Usuário não autenticado' });
    }

    const { id } = request.params;
    const { status, type, startDate, endDate } = request.body;
    const userId = request.user.id;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const checkQuery = `
        SELECT id, type, start_date, end_date, user_id, status as current_status
        FROM requests
        WHERE id = $1 AND user_id = $2
      `;

      const { rows: checkRows } = await client.query(checkQuery, [id, userId]);

      if (checkRows.length === 0) {
        await client.query('ROLLBACK');
        return reply.status(404).send({ message: 'Requisição não encontrada' });
      }

      const requestData = checkRows[0];

      if (type || startDate || endDate) {
        if (requestData.current_status === 'APPROVED') {
          await client.query('ROLLBACK');
          return reply.status(400).send({ message: "Não é possível editar uma solicitação já aprovada" });
        }

        const newType = type || requestData.type;
        const newStart = startDate || requestData.start_date;
        const newEnd = endDate || requestData.end_date;

        if (new Date(newEnd) < new Date(newStart)) {
          await client.query('ROLLBACK');
          return reply.status(400).send({ message: "Data final não pode ser anterior à data inicial" });
        }

        const updateDataQuery = `
          UPDATE requests
          SET type = $1, start_date = $2, end_date = $3
          WHERE id = $4
          RETURNING id, type, start_date, end_date, status, created_at
        `;

        const { rows: updateRows } = await client.query(updateDataQuery, [newType, newStart, newEnd, id]);

        await client.query('COMMIT');
        return {
          message: 'Solicitação atualizada com sucesso',
          request: updateRows[0]
        };
      }

      if (status) {
        if (status === 'APPROVED' && requestData.type === 'ferias') {
          const balance = await getUserBalance(requestData.user_id);
          const feriasDiffInDays = Math.floor((new Date(requestData.end_date) - new Date(requestData.start_date)) / (1000 * 60 * 60 * 24)) + 1;

          if (balance.ferias < feriasDiffInDays) {
            await client.query('ROLLBACK');
            return reply.status(400).send({ message: "Saldo de férias insuficiente para este período" });
          }

          await updateUserBalance(requestData.user_id, 'ferias', feriasDiffInDays);
        }

        if (status === 'APPROVED' && requestData.type === 'day-off') {
          const balance = await getUserBalance(requestData.user_id);
          const dayoffDiffInDays = Math.floor((new Date(requestData.end_date) - new Date(requestData.start_date)) / (1000 * 60 * 60 * 24)) + 1;

          if (balance.day_off < dayoffDiffInDays) {
            await client.query('ROLLBACK');
            return reply.status(400).send({ message: "Saldo de day-off insuficiente para este período" });
          }

          await updateUserBalance(requestData.user_id, 'day-off', dayoffDiffInDays);
        }

        const updateStatusQuery = `
          UPDATE requests
          SET status = $1
          WHERE id = $2
          RETURNING id, type, start_date, end_date, status, created_at
        `;

        const { rows: updateRows } = await client.query(updateStatusQuery, [status, id]);
        const updatedRequest = updateRows[0];

        const historyQuery = `
          INSERT INTO requests_history (request_id, status, changed_by)
          VALUES ($1, $2, $3)
          RETURNING id, created_at
        `;

        await client.query(historyQuery, [id, status, userId]);

        await client.query('COMMIT');

        return {
          message: 'Status atualizado com sucesso',
          request: updatedRequest
        };
      }

      await client.query('ROLLBACK');
      return reply.status(400).send({ message: 'Nada para atualizar' });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  server.delete('/:id', async (request, reply) => {
    if (!request.user?.id) {
      return reply.status(401).send({ message: 'Usuário não autenticado' });
    }

    const { id } = request.params;
    const userId = request.user.id;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const checkQuery = `
        SELECT id, type, start_date, end_date, status FROM requests
        WHERE id = $1 AND user_id = $2
      `;

      const { rows: checkRows } = await client.query(checkQuery, [id, userId]);

      if (checkRows.length === 0) {
        await client.query('ROLLBACK');
        return reply.status(404).send({ message: 'Requisição não encontrada' });
      }

      const requestData = checkRows[0];

      if (requestData.status === 'APPROVED') {
        const diffInDays = Math.floor((new Date(requestData.end_date) - new Date(requestData.start_date)) / (1000 * 60 * 60 * 24)) + 1;
        await restoreUserBalance(userId, requestData.type, diffInDays);
      }

      await client.query(`DELETE FROM requests_history WHERE request_id = $1`, [id]);

      await client.query(`DELETE FROM requests WHERE id = $1`, [id]);

      await client.query('COMMIT');

      return {
        message: 'Requisição deletada com sucesso',
        id: id
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });
}
