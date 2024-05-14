function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // format as 2 digits, padding with 0 if needed
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getDateNDaysAgo(n) {
    const now = new Date();
    now.setDate(now.getDate() - n); // subtract n days
    return formatDate(now);
}

export const dates = {
    startDate: getDateNDaysAgo(3),
    endDate: getDateNDaysAgo(1) // n=1 for yesterday's data
}