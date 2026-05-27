export default async function handler(req, res) {
    // 1. Bloqueia qualquer método que não seja POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message, token } = req.body;

    // 2. Verifica se o usuário resolveu o Turnstile
    if (!token) {
        return res.status(400).json({ error: 'Validação de segurança (Turnstile) ausente.' });
    }

    try {
        // 3. Valida o token no servidor do Cloudflare usando a Secret Key da Vercel
        const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
        });

        const turnstileData = await turnstileVerify.json();

        if (!turnstileData.success) {
            return res.status(403).json({ error: 'Falha na verificação de segurança. Tente novamente.' });
        }

        // 4. Se o usuário é legítimo, envia os dados para a sua Planilha do Google
        const sheetResponse = await fetch(process.env.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        if (!sheetResponse.ok) {
            throw new Error('Erro ao comunicar com a planilha.');
        }

        // 5. Retorna sucesso para o Frontend!
        return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
        
    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: 'Erro interno ao processar o envio.' });
    }
}