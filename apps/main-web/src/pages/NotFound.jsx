import { Link } from 'react-router-dom';
import { NotFoundPage } from '@dikshant/ui';

function NotFound({ addCursor, removeCursor, cursorModes }) {
  return (
    <NotFoundPage
      LinkComponent={Link}
      linkProp="to"
      homeHref="/"
      connectHref="/connect"
      cursorEvents={{ addCursor, removeCursor, cursorModes }}
    />
  );
}

export default NotFound;
