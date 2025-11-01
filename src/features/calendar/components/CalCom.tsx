/* First make sure that you have installed the package */

/* If you are using yarn */
// yarn add @calcom/embed-react

/* If you are using npm */
// npm install @calcom/embed-react

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

export const CalCom = () => {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: 'secret' });
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    })();
  }, []);
  return (
    <Cal
      namespace="appointment"
      calLink="maciej-grzybek-18tllp/appointment"
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      config={{ layout: 'month_view' }}
    />
  );
};
