import LegalPageView from '../components/LegalPageView';
import { getLegalPageFallback } from '../utils/legalPageDefaults';

export default function AboutUsScreen() {
  return (
    <LegalPageView slug="about" showAboutHero fallback={getLegalPageFallback('about')} />
  );
}
