import { TUserSession } from '@/common/utils/types';
import { MainUserService } from '@/database/main/services/main-user.service';
import { User } from '@/database/tenant/entities';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { omit } from 'lodash';

@Injectable()
export class UserService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly mainUserService: MainUserService,
  ) {}
  async getMe(userSession: TUserSession) {
    const { userId, bookStoreId, role } = userSession;

    if (!bookStoreId?.trim() || role === UserRole.OWNER) {
      const user = await this.mainUserService.findUserByField('id', userId);
      if (!user) throw new NotFoundException('User not found.');

      return omit(user, ['password']);
    } else {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const userTenant = dataSource.getRepository(User);

      const user = await userTenant.findOne({
        where: {
          id: userId,
        },
        relations: {
          employee: role === UserRole.EMPLOYEE,
        },
      });

      if (!user) throw new NotFoundException('Your profile not found.');

      return omit(user, ['employee.password']);
    }
  }
}
