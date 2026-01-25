export const generateWhatsAppLink = (phoneNumber, message = '') => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
};

export const openWhatsApp = (phoneNumber, message = '') => {
  const link = generateWhatsAppLink(phoneNumber, message);
  window.open(link, '_blank');
};