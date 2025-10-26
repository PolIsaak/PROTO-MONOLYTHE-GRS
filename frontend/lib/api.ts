/**
 * API Client para comunicarse con el backend
 * Maneja todas las peticiones HTTP y autenticación
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Cliente HTTP con configuración base
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Método genérico para hacer peticiones HTTP
   */
  private async request<TResponse>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TResponse> {
    const token = this.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data: TResponse = await response.json();

      if (!response.ok) {
        const errorData = data as unknown as ApiErrorResponse;
        throw new ApiError(
          errorData.message || 'Error en la petición',
          response.status,
          errorData
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Error de conexión con el servidor', 500);
    }
  }

  /**
   * Métodos HTTP
   */
  async get<TResponse>(endpoint: string): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { method: 'GET' });
  }

  async post<TResponse, TBody = unknown>(
    endpoint: string, 
    data?: TBody
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<TResponse, TBody = unknown>(
    endpoint: string, 
    data?: TBody
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<TResponse>(endpoint: string): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Error personalizado para la API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * ============================================================================
 * TIPOS DE RESPUESTA DE LA API
 * ============================================================================
 */

/**
 * Respuesta base de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Respuesta de error de la API
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * ============================================================================
 * TIPOS DE AUTENTICACIÓN
 * ============================================================================
 */

export interface LoginRequest {
  curp: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  estudiante: EstudianteBasic;
}

export interface EstudianteBasic {
  id: number;
  curp: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  grado: number;
  grupo: string;
}

export interface EstudianteProfile extends EstudianteBasic {
  created_at: string;
}

/**
 * ============================================================================
 * TIPOS DE CALIFICACIONES
 * ============================================================================
 */

export interface Calificacion {
  id: number;
  calificacion: number;
  fecha_registro: string;
  materia: string;
  materia_clave: string;
  periodo: string;
  periodo_numero: number;
}

export interface CalificacionesResponse {
  calificaciones: Calificacion[];
  promedio: number;
  materiasReprobadas: number;
  periodo: number;
}

/**
 * ============================================================================
 * TIPOS DE TUTORES
 * ============================================================================
 */

export interface Tutor {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  email: string;
  relacion: string;
}

export interface TutoresResponse {
  tutores: Tutor[];
}

/**
 * ============================================================================
 * TIPOS DE RIESGO ACADÉMICO
 * ============================================================================
 */

export interface RiesgoAcademico {
  status: boolean;
  razones: string[];
}

export interface CriteriosRiesgo {
  promedioMinimo: number;
  materiasReprobadasMaximo: number;
}

export interface RiesgoResponse {
  estudiante: {
    id: number;
    nombre: string;
    grado: number;
    grupo: string;
  };
  promedio: number;
  materiasReprobadas: number;
  enRiesgo: RiesgoAcademico;
  criterios: CriteriosRiesgo;
}

/**
 * ============================================================================
 * TIPOS DE RESUMEN ACADÉMICO
 * ============================================================================
 */

export interface ResumenAcademicoResponse {
  estudiante: EstudianteBasic;
  calificaciones: Calificacion[];
  promedio: number;
  materiasReprobadas: number;
  tutores: Tutor[];
  enRiesgo: RiesgoAcademico;
}

/**
 * ============================================================================
 * PARÁMETROS DE QUERY
 * ============================================================================
 */

export interface CalificacionesQueryParams {
  periodo?: 1 | 2 | 3;
}

export interface ResumenQueryParams {
  periodo?: 1 | 2 | 3;
}

export interface RiesgoQueryParams {
  periodo?: 1 | 2 | 3;
}

/**
 * ============================================================================
 * SERVICIO DE AUTENTICACIÓN
 * ============================================================================
 */
export const authService = {
  /**
   * Login de estudiante
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>, LoginRequest>(
      '/auth/login',
      credentials
    );
    
    if (response.success && response.data) {
      // Guardar token en localStorage
      localStorage.setItem('auth_token', response.data.token);
      return response.data;
    }
    
    throw new Error(response.message || 'Error en el login');
  },

  /**
   * Logout
   */
  logout: (): void => {
    localStorage.removeItem('auth_token');
  },

  /**
   * Verificar si hay token
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Obtener token
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  /**
   * Verificar token con el servidor
   */
  verifyToken: async (): Promise<EstudianteProfile> => {
    const response = await apiClient.get<ApiResponse<{ estudiante: EstudianteProfile }>>(
      '/auth/verify'
    );
    
    if (response.success && response.data) {
      return response.data.estudiante;
    }
    
    throw new Error('Token inválido');
  },
};

/**
 * ============================================================================
 * SERVICIO DE ESTUDIANTES
 * ============================================================================
 */
export const estudianteService = {
  /**
   * Obtener perfil del estudiante autenticado
   */
  getProfile: async (): Promise<EstudianteProfile> => {
    const response = await apiClient.get<ApiResponse<{ estudiante: EstudianteProfile }>>(
      '/estudiantes/profile'
    );
    
    if (response.success && response.data) {
      return response.data.estudiante;
    }
    
    throw new Error('Error al obtener perfil');
  },

  /**
   * Obtener calificaciones de un estudiante
   * @param estudianteId - ID del estudiante
   * @param params - Parámetros opcionales de query (periodo)
   */
  getCalificaciones: async (
    estudianteId: number,
    params?: CalificacionesQueryParams
  ): Promise<CalificacionesResponse> => {
    const queryString = params?.periodo ? `?periodo=${params.periodo}` : '';
    const response = await apiClient.get<ApiResponse<CalificacionesResponse>>(
      `/estudiantes/${estudianteId}/calificaciones${queryString}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Error al obtener calificaciones');
  },

  /**
   * Obtener resumen académico completo
   * @param estudianteId - ID del estudiante
   * @param params - Parámetros opcionales de query (periodo)
   */
  getResumen: async (
    estudianteId: number,
    params?: ResumenQueryParams
  ): Promise<ResumenAcademicoResponse> => {
    const queryString = params?.periodo ? `?periodo=${params.periodo}` : '';
    const response = await apiClient.get<ApiResponse<ResumenAcademicoResponse>>(
      `/estudiantes/${estudianteId}/resumen${queryString}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Error al obtener resumen');
  },

  /**
   * Verificar riesgo académico del estudiante
   * @param estudianteId - ID del estudiante
   * @param params - Parámetros opcionales de query (periodo)
   */
  getRiesgo: async (
    estudianteId: number,
    params?: RiesgoQueryParams
  ): Promise<RiesgoResponse> => {
    const queryString = params?.periodo ? `?periodo=${params.periodo}` : '';
    const response = await apiClient.get<ApiResponse<RiesgoResponse>>(
      `/estudiantes/${estudianteId}/riesgo${queryString}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Error al verificar riesgo');
  },

  /**
   * Obtener tutores del estudiante
   * @param estudianteId - ID del estudiante
   */
  getTutores: async (estudianteId: number): Promise<TutoresResponse> => {
    const response = await apiClient.get<ApiResponse<TutoresResponse>>(
      `/estudiantes/${estudianteId}/tutores`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Error al obtener tutores');
  },
};

// Instancia del cliente API
const apiClient = new ApiClient(API_URL);

export { apiClient };