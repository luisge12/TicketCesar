import { ZodError } from 'zod';

export function validateRequest(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                return res.status(400).json({ error: 'Datos de entrada inválidos', details: errorMessages });
            }
            next(error);
        }
    };
}
