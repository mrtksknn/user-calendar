import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
  profile?: UserInstance | null; // profil null olabilir
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  // Güvenli fallback'ler
  const name = profile?.name ?? "Kullanıcı";
  const email = profile?.email ?? AuthSession.getEmail() ?? "Email bulunamadı";
  const roleName = profile?.role?.name ?? AuthSession.getRoles()?.name ?? "Rol bulunamadı";

  return (
    <div className="profile-section">
      <div className="profile-info">
        <h2>Welcome, {name}</h2>
        <p>{email}</p>
        <p>{roleName}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
