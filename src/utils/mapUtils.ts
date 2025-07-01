export const OLD_THRESHOLD = new Date('2020-01-01');

export function getColorByDate(date: string) {
    return new Date(date) < OLD_THRESHOLD ? 'red' : 'green';
}

export function getColorByAccuracy(accuracy: string) {
    return accuracy.toLowerCase() === 'high' ? 'green' : 'red';
}