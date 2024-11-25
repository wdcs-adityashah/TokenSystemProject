import withAuth from "next-auth/middleware";
const ProtectedPage = () => {
    return (
        <div>
            <h1>This is a protected page</h1>
        </div>
    );
};

export default withAuth(ProtectedPage);