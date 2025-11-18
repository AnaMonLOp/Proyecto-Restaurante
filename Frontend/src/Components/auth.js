const mockUsuarios = [
  { 
    id: "1", 
    identificador: "mesero", 
    password: "123", 
    nombre: "Juan Mesero", 
    rol: "mesero" 
  },
  { 
    id: "2", 
    identificador: "cocina", 
    password: "123", 
    nombre: "Ana Cocina", 
    rol: "cocina" 
  },
  { 
    id: "3", 
    identificador: "admin", 
    password: "123", 
    nombre: "Luis Admin", 
    rol: "administrador" 
  }
];


export const login = (identificador, password) => {
  console.log(`[MOCK LOGIN] Intentando entrar con: ${identificador} / ${password}`);

  const usuarioEncontrado = mockUsuarios.find(
    (user) => user.identificador === identificador && user.password === password
  );

  return usuarioEncontrado || null;
};