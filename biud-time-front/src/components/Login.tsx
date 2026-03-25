import { useState } from "react"
import { login } from "../services/api"

interface LoginProps {
    onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        try {
            setError("")
            const response = await login({ email, password })

            localStorage.setItem('@biud-time:token', response.token)
            localStorage.setItem('@biud-time:user', JSON.stringify(response.user))

            onLoginSuccess()
        } catch (err) {
            setError("E-mail ou senha incorretos.")
        }
    }

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">Bem-vindo(a)</h2>
                <p className="login-subtitle">Faça login para acessar suas solicitações</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            className="login-input"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-input-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            className="login-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Entrar</button>
                </form>
            </div>
        </div>
    )
}