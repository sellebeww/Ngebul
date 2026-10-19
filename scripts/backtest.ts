import {makeSeeds,DEMO_DATE} from '../src/domain/seed';
import {compareModes,cohort} from '../src/domain/evaluation';
import {project,structural} from '../src/domain/engine';
const seeds=makeSeeds();
console.log('DATA FIKTIF — pembanding asumsi simulasi, bukan bukti sebab-akibat');
for(const h of seeds) console.log(JSON.stringify({name:h.name,structural:structural(h,DEMO_DATE),runway:project(h,DEMO_DATE).runway,modes:compareModes(h,DEMO_DATE)}));
console.log('Cohort:',cohort(seeds,DEMO_DATE));
