/** File Hash: 3a6a6844bae6b81d86f94becf1fdcfc6f19bbf19b87a61d7b3261bff92b7cf3d */

/** Autogenerated Code - Do Not Touch */
/* eslint-disable */

import { useService } from './service';
import type { User } from "@/dtos/user/user"
import type { UserDetail } from "@/dtos/user/user-detail"
import type { UserEdit } from "@/dtos/user/user-edit"
import type { UserEditPassword } from "@/dtos/user/user-edit-password"
import type { TicketSearch } from "@/dtos/ticket/ticket-search"
import type { Page } from "@/dtos/page"
import type { Pagination } from "@/dtos/pagination"
import type { TicketDetail } from "@/dtos/ticket/ticket-detail"
import type { UserSearch } from "@/dtos/user/user-search"

export function useUserService() {
  const basePath = `api/v1/users`;
  const { api, filterSearchParams } = useService(basePath);
  
  async function create(userRegisterDto: User): Promise<UserDetail> {
    return api.post(``, { json: userRegisterDto }).json();
  }
  async function deleteCurrentUser(): Promise<void> {
    await api.delete(``)
  }
  async function deleteUser(id: number): Promise<void> {
    await api.delete(`${id}`)
  }
  async function editUser(userEditDto: UserEdit): Promise<UserDetail> {
    return api.patch(``, { json: userEditDto }).json();
  }
  async function editUserPassword(userEditPasswordDto: UserEditPassword): Promise<UserDetail> {
    return api.patch(`change-password`, { json: userEditPasswordDto }).json();
  }
  async function fetchCurrentUser(): Promise<UserDetail> {
    return api.get(`detail`).json();
  }
  async function fetchOrdersByUser(): Promise<any> {
    return api.get(`orders`).json();
  }
  async function fetchTicketsByUser(ticketSearchDto: TicketSearch, pageDto: Page): Promise<Pagination<TicketDetail>> {
    return api.get(`tickets`, { searchParams: filterSearchParams([['pageSize', pageDto.pageSize], ['state', ticketSearchDto.state], ['pageIndex', pageDto.pageIndex]]) }).json();
  }
  async function findByFilters(userSearchDto: UserSearch, page: Page): Promise<Pagination<UserDetail>> {
    return api.get(``, { searchParams: filterSearchParams([['pageSize', page.pageSize], ['email', userSearchDto.email], ['pageIndex', page.pageIndex]]) }).json();
  }
  async function lock(id: number, lock: boolean): Promise<void> {
    await api.patch(`${id}/lock`, { json: lock })
  }
  return {
    create,
    deleteCurrentUser,
    deleteUser,
    editUser,
    editUserPassword,
    fetchCurrentUser,
    fetchOrdersByUser,
    fetchTicketsByUser,
    findByFilters,
    lock,
  };
}