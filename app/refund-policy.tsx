import LegalPageView from '../components/LegalPageView';
import { getLegalPageFallback } from '../utils/legalPageDefaults';

export default function RefundPolicyScreen() {
  return (
    <LegalPageView
      slug="refund"
      fallback={getLegalPageFallback('refund')}
    />
  );
}
