import "../../styles/Admin.css";

const TopBar = ({ title }) => {
  return (
    <header className="top-bar">
      <h1>{title}</h1>
      <div className="top-bar-user">
        <span>Admin</span>
        <img
          src="https://ui-avatars.com/api/?name=Admin"
          alt="admin avatar"
        />
      </div>
    </header>
  );
};

export default TopBar;
