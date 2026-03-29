/**
 * Higher-order middleware function to restrict route access based on user role
 */
declare const authorize: (...roles: string[]) => (req: any, res: any, next: any) => any;
export default authorize;
//# sourceMappingURL=rbac.d.ts.map