import { configure } from '@storybook/preact'

// automatically import all files ending in *.stories.js
configure(require.context('../src/stories', true, /\.stories\.jsx?$/), module);
