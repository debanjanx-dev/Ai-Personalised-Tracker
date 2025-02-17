import { query } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from '@/node_modules/next/types';


export default async function handler (req: NextApiRequest ,res : NextApiResponse) {
    if(req.method != 'GET'){
        res.status(405).json({message : "method not allowed"})
    }
    try {

        //fecth the taks from the databse
        const result = await query("SELECT * FROM tasks ORDER BY created_at DESC")
        res.status(200).json({tasks : result.rows}); 
        
        
    } catch (error) {
        console.error("Error showing task:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}