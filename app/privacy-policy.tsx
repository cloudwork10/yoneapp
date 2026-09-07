import LegalPageView from '../components/LegalPageView';
import { getLegalPageFallback } from '../utils/legalPageDefaults';

export default function PrivacyPolicyScreen() {
  return (
    <LegalPageView
      slug="privacy"
      fallback={getLegalPageFallback('privacy')}
    />
  );
}
