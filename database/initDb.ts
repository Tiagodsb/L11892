import { type SQLiteDatabase } from 'expo-sqlite';
import lei from '../assets/11892.json';

export default async function InitDb(db: SQLiteDatabase) {
    try {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS dispositivos(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                texto TEXT,
                estilo TEXT,
                revogado INTEGER NOT NULL DEFAULT 0
            )    
        `);
        console.log("banco de dados inicializado");
        
        const result = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM dispositivos`);

        if (result?.count && result.count > 0) {
        console.log('Banco já populado, pulando insert');
        return;
        }

        console.log('Populando banco de dados...');

        await db.withTransactionAsync(async () => {
            for (const d of lei.conteudo) {
                await db.runAsync(
                `INSERT INTO dispositivos (texto, estilo, revogado)
                VALUES (?, ?, ?)`,
                [d.texto, d.estilo, d.revogado ? 1 : 0]
                );
            }
        });

        console.log('Banco populado com sucesso 🚀');
    } catch (error) {
        console.error("erro, não foi possível inicializar o banco de dados:", error);   
        
    }
}