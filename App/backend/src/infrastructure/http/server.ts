import express from 'express';
import usuarioRoutes from './routes/usuario.routes.js';
import solicitacaoRoutes from './routes/solicitacao.routes.js';
import slotRoutes from './routes/slot.routes.js';
import disciplinasRoutes from './routes/disciplinas.routes.js';
import sessaoRoutes from './routes/sessao.routes.js';


const app = express();

app.use(express.json());
app.use('/api/v1', usuarioRoutes);
app.use('/api/v1', solicitacaoRoutes);
app.use('/api/v1', slotRoutes);
app.use('/api/v1', disciplinasRoutes);
app.use('/api/v1', sessaoRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n✅ Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Teste a API em: http://localhost:${PORT}/api/v1/`);
});
