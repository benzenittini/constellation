
import { Request, Response } from "express";

export async function example(req: Request, res: Response) {
    res.json({ hello: 'there' });
}