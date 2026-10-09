// import { createRouter, createWebHistory } from 'vue-router'
import { createRouter, createWebHistory } from '@ionic/vue-router'

import HomeView      from '../views/HomeView.vue'
import AboutView     from '../views/AboutView.vue'
import AccountView   from '../views/AccountView.vue'
import AddItemView   from '../views/item/AddItemView.vue'
import ArtistView    from '../views/ArtistView.vue'
import EditItemView  from '../views/item/EditItemView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import ForgotView    from '../views/ForgotView.vue'
import GalleryView   from '../views/gallery/GalleryView.vue'
import GalleriesView from '../views/gallery/GalleriesView.vue'
import GroupView     from '../views/GroupView.vue'
import GroupsView    from '../views/GroupsView.vue'
import InvisibleView from '../views/InvisibleView.vue'
import ItemView      from '../views/item/ItemView.vue'
import LoginView     from '../views/LoginView.vue'
import MessageView   from '../views/MessageView.vue'
import RandomView    from '../views/RandomView.vue'
import RecentView    from '../views/RecentView.vue'
import RegisterView  from '../views/RegisterView.vue'
import SearchView    from '../views/SearchView.vue'
import UserView      from '../views/UserView.vue'
import ViewedView    from '../views/viewed/ViewedView.vue'
import { Route } from '@/utils/constants'

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: [
      createRoute(Route.HOME,       HomeView),
      createRoute(Route.ABOUT,      AboutView),
      createRoute(Route.ACCOUNT,    AccountView),
      createRoute(Route.ADD_ITEM,   AddItemView),
      createRoute(Route.ARTIST,     ArtistView,    ':id'),
      createRoute(Route.EDIT_ITEM,  EditItemView,  ':id'),
      createRoute(Route.FAVORITES,  FavoritesView),
      createRoute(Route.FORGOT,     ForgotView),
      createRoute(Route.GALLERY,    GalleryView,   ':id'),
      createRoute(Route.GALLERIES,  GalleriesView, ':id'),
      createRoute(Route.GROUP,      GroupView,     ':id'),
      createRoute(Route.GROUP_CHAT, GroupView,     ':id/:chatId'),
      createRoute(Route.GROUPS,     GroupsView),
      createRoute(Route.INVISIBLE,  InvisibleView),
      createRoute(Route.ITEM,       ItemView,      ':origin/:nav/:id'),
      createRoute(Route.ITEM_CHILD, ItemView,      ':origin/:nav/:id/:child'),
      createRoute(Route.LOGIN,      LoginView),
      createRoute(Route.MESSAGE,    MessageView),
      createRoute(Route.RANDOM,     RandomView),
      createRoute(Route.RECENT,     RecentView,    ':id'),
      createRoute(Route.REGISTER,   RegisterView,  ':registerId'),
      createRoute(Route.SEARCH,     SearchView),
      createRoute(Route.USER,       UserView,      ':id'),
      createRoute(Route.VIEWED,     ViewedView,    ':id'),
  ]
})

function createRoute(route, component, urlParams = "") { 
   return { name: route.name, component: component, path: route.url + urlParams, props: true } 
}

export default router
