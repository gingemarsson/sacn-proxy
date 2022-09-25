export const getResponseContentOrError = async <T>(res: Response): Promise<T> => {
    if (res.status !== 200) {
        throw Error(`Error ${res.status}: ${JSON.parse(await res.text()).message}`);
    }

    const result = res.json();
    return result;
};
