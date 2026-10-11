export interface EmisorHighlight {
  title: string;
  text: string;
}

export interface Emisor {
  name: string;
  cuit: string;
  address: string;
  service: string;
  serviceSell: string;
  email: string;
  website: string;
  highlight: EmisorHighlight;
  activationCode: string;
  proveedorEmail: string;
}

export const EMISOR: Emisor = {
  name: 'Elevatronix',
  cuit: 'CUIT 20-28304-415-8',
  address: 'Arturo Frondizi 3751, Villa Pueyrredón, San Martín, Pcia de Bs.As.',
  service: '1131663359',
  serviceSell: '1126043358',
  email: 'elevatronix@gmail.com',
  website: 'www.elevatronix.com.ar',
  highlight: {
    title: 'Importante',
    text: 'De encontrarse alguna anomalía o vicio oculto luego del desarme, se le informará a vuestro personal a cargo detallando costos de reparación y/o repuestos reemplazados.'
  },
  activationCode: 'COTIX2026',
  proveedorEmail: 'elevatronix@gmail.com'
};
