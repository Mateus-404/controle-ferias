import { useState } from "react"
import { register } from "../services/api"

interface RegisterProps {
    onRegisterSuccess: () => void;
    onSwitchToLogin?: () => void;
}

export function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            setError("")
            const response = await register({ nome, email, password })

            localStorage.setItem('@biud-time:token', response.token)
            localStorage.setItem('@biud-time:user', JSON.stringify(response.user))

            onRegisterSuccess()
        } catch (err) {
            setError("Erro ao cadastrar. Tente outro email.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">Criar Conta</h2>
                <p className="login-subtitle">
                    Cadastre-se para acessar o sistema ou{' '}
                    <span onClick={onSwitchToLogin} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                        clique aqui para fazer login
                    </span>
                </p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <label htmlFor="nome">Nome</label>
                        <input
                            id="nome"
                            type="text"
                            className="login-input"
                            placeholder="Seu nome completo"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? <div className="spinner spinner-small spinner-white"></div> : "Cadastrar"}
                    </button>
                </form>
            </div>
        </div>
    )
}