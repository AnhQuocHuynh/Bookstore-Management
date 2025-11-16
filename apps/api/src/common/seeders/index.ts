import { MainSeeder } from '@/common/seeders/main.seeder';
import AppDataSource from '@/config/typeorm.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';

const options: DataSourceOptions & SeederOptions = {
  ...AppDataSource.options,
  seeds: [MainSeeder],
};

const datasource = new DataSource(options);

const initializeDataSource = async () => {
  try {
    await datasource.initialize();
    await runSeeders(datasource);
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(
      '❌ Error during data source initialization or seeding:',
      error,
    );
    process.exit(1);
  } finally {
    await datasource.destroy();
  }
};

initializeDataSource().catch((err) => {
  console.error(err);
  process.exit(1);
});
