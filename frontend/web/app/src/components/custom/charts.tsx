import { PieChartCustom } from '@/components/custom/PieChart';

interface ChartsInfo {
  data1: object;
  data2: object;
  title1: string;
  title2: string;
  description1?: string;
  description2?: string;
  label1: string;
  label2: string;
  dataKey1: string;
  dataKey2: string;
  nameKey1: string;
  nameKey2: string
}

export const Charts = ({data1, data2, title1, title2, description1, description2, label1, label2, dataKey1, dataKey2, nameKey1, nameKey2}: ChartsInfo) => (
    <div className="mb-4">
      <div className='flex flex-row gap-4'>
          <PieChartCustom
            title={title1}
            label={label1}
            description={description1}
            dataKey={dataKey1}
            nameKey={nameKey1}
            chartData={data1}
          />
          <PieChartCustom
            title={title2}
            label={label2}
            description={description2}
            dataKey={dataKey2}
            nameKey={nameKey2}
            chartData={data2}
          />
      </div>
    </div>
  );