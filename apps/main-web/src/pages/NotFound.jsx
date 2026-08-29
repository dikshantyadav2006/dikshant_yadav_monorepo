import { TransitionLink } from '@animation';
import { NotFoundPage } from '@dikshant/ui';

function NotFound({ addCursor, removeCursor, cursorModes }) {
  return (
    <NotFoundPage
      LinkComponent={TransitionLink}
      linkProp="href"
      homeHref="/"
      connectHref="/connect"
      cursorEvents={{ addCursor, removeCursor, cursorModes }}
    />
  );
}

export default NotFound;
