// Export employees feature components, hooks, and types
export { EmployeesPage } from "./components/EmployeesPage";
export { EmployeeListPage } from "./components/EmployeeListPage";
export { EmployeeTable } from "./components/EmployeeTable";
export { EmployeeDetailPanel } from "./components/EmployeeDetailPanel";
export { EmployeeEditPanel } from "./components/EmployeeEditPanel";
export { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from "./hooks/useEmployees";
export type { Employee, EmployeeTableRow, EmployeeFormData, EmployeeListResponse } from "./types";
