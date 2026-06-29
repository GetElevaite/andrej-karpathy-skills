import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Bump down to 1 if parallel Chrome render tabs strain the machine.
Config.setConcurrency(null);
