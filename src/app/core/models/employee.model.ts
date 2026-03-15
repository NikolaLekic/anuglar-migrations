export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive' | 'on-leave';
  joinDate: string;
  phone: string;
  address: string;
  salary: number;
  manager: string;
  bio: string;
}
