// Mock react-leaflet components for tests
export const MapContainer = ({ children }) => <div data-testid="map">{children}</div>;
export const TileLayer = () => null;
export const Marker = () => null;

