/** Estilos Google Maps — independientes del tema de la aplicación */
export const googleMapDarkStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7a7a6a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a14' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0f1a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a1e' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#3a3a2a' }] },
];
