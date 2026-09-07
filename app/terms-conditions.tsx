import LegalPageView from '../components/LegalPageView';
import { getLegalPageFallback } from '../utils/legalPageDefaults';

export default function TermsConditionsScreen() {
  return (
    <LegalPageView
      slug="terms"
      fallback={getLegalPageFallback('terms')}
    />
  );
}
