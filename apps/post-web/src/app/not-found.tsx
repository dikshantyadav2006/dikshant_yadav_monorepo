import Link from 'next/link';
import { NotFoundPage } from '@dikshant/ui';

export default function NotFound() {
  return (
    <NotFoundPage
      LinkComponent={Link}
      homeHref="/"
      connectHref="https://dikshantyadav.in/connect"
    />
  );
}
