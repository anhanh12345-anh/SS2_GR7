export const formatCurrency = (amount, currency = 'VND') => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatDate = (date, format = 'dd/MM/yyyy') => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  if (format === 'dd/MM/yyyy') return `${day}/${month}/${year}`;
  if (format === 'MM/yyyy') return `${month}/${year}`;
  if (format === 'yyyy-MM-dd') return `${year}-${month}-${day}`;
  return `${day}/${month}/${year}`;
};

export const getMonthName = (month) => {
  const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  return months[month - 1] || '';
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const COLORS = [
  '#6c63ff', '#00d48a', '#ff5b7d', '#ffb347', '#00c6ff',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'
];

export const truncate = (str, n = 30) => str?.length > n ? str.substring(0, n) + '...' : str;
