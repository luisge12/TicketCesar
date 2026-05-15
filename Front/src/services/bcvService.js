export async function getBcvRate() {
    try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (!response.ok) {
            throw new Error('No se pudo obtener la tasa');
        }
        const data = await response.json();
        return data.promedio;
    } catch (error) {
        console.error('Error fetching BCV rate:', error);
        return null;
    }
}
