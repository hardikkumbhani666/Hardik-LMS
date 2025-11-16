import AuditTrail from '../common/AuditTrail'
import { useAuth } from '../../context/AuthContext'

const AuditTrailView = () => {
  const { user } = useAuth()

  return <AuditTrail userId={user?._id} />
}

export default AuditTrailView

