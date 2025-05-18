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

      <div className="circle" style={{
        height: '75px',
        width: '75px',
        borderRadius: '50%',
        color: '#3788d8',
        border: '2px solid #fff',
        display: 'flex',
        placeContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '20px'
      }}>
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="profile-info">
        <h3 style={{ fontSize: '20px !important', fontWeight: '600' }}>{name}</h3>
        <p style={{ fontSize: '14px' }}>{email}</p>
        <p style={{
          borderRadius: '8px',
          border: 'none',
          display: 'flex',
          color: '#fff',
          padding: '.3rem .8rem',
          background: '#3788d8',
          placeContent: 'center',
          fontSize: '12px',
          width: 'fit-content'
        }}>{roleName}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
