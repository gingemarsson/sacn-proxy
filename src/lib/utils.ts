export const getCategoryLogger = (category: string) => (message: string) => log(message, category);

export const log = (message: string, category: string) => console.log(`[${category}] ${message}`);
