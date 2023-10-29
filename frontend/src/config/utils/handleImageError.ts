export const handleImageError = (e: { target: { src: string; }; }) => {
  e.target.src = `https://miro.medium.com/max/1400/1*1QzjvXVGuk6XTHESIB5nkQ.jpeg`;
};