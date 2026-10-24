import AuthShell from "@/components/AuthShell";

const Layout = ({ children } : { children : React.ReactNode }) => {
    return <AuthShell>{children}</AuthShell>;
};
export default Layout;