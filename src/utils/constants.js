
export const ActionStatus = {
   CREATED:   'Created',
   CHAINED:   'Chained',
   BYPASSED:  'Bypassed',  // set by backend
   PROCESSED: 'Processed', // set by backend
   PROCESSING:'Processing',// set by backend
   ERROR:     'Error'      // set by backend
}

export const ActionType = {
   FEED_UPDATE:   'FeedUpdate',
   ACCEPT_INVITE: 'AcceptInvite',
   ACCEPT_GROUP_INVITE:  'AcceptGroupInvite',
   DECLINE_GROUP_INVITE: 'DeclineGroupInvite',
   IMAGE:         'Image',
   PROCESS:       'Process',
   SEND_EMAIL:    'SendEmail', 
}

export const ArtistRole = {
   ALL:      'All',
   PENCILS:  'Pencils',
   INKS:     'Inks',
   LAYOUT:   'Layouts',
   FINISH:   'Finishes',
   AFTER:    'After/Homage',
   WRITER:   'Writer',
}

export const ArtistRoles = [ 
   ArtistRole.ALL, ArtistRole.PENCILS, ArtistRole.INKS, ArtistRole.LAYOUT, 
   ArtistRole.FINISH, ArtistRole.AFTER, ArtistRole.WRITER ]

export const ArtistState = {
   PRIMARY:  'Primary',
   AKA:      'AKA',
}

export const ChatStatus = {
   ACTIVE:   'Active',
   ARCHIVED: 'Archived',
}
export const ChatStatuses = [ ChatStatus.ACTIVE, ChatStatus.ARCHIVED ]

export const Defaults = {
   DELETED_USER_ID: "0",
   MAX_WALL_ITEMS:  20,
   SITE_ID:         "0",
   MAX_THUMB_SIDE:  300, // thumb was resized to a 300x300 box
}

export const DefaultWall = { wallRows:0, wallItems:[] }    

export const EmailSourceState = {
   EMAIL_SENT: 'Email Sent', // set by backend
}
 
export const Emit = {
   CANCEL:      'cancel',
   CLOSE:       'close',
   CONFIRM:     'confirm',
   DELETE:      'delete',
   DONE:        'done',
   ITEM:        'item',
   LOADED:      'loaded',
   POPUP:       'popup',
   SELECT:      'select',
   STATE:       'state',
   SWIPE_LEFT:  'swipeLeft',
   SWIPE_RIGHT: 'swipeRight',
   SWIPE_UP:    'swipeUp',
   SWIPE_DOWN:  'swipeDown',
   TOGGLE:      'toggle',
   USER_ID:     'userId',
}

export const FeedAction = {
   PUBLISH:    'Publish',
   RETRACT:    'Retract',
}

export const GalleryThumbWidth = 250
export const GalleryThumbOptions = {
   SHOW_CHILD:   'Show Child Galleries',
   SHOW_PRIVATE: 'Show My Private Galleries',
   USER:         'User',
   UPDATED:      'Date Updated',
}

export const ParentFeedType = {
   SAVED:    'Saved',
}

export const FeedType = {
   USER:    'User',
   GROUP:   'Group',
}

export const FileSuffix = {
   MOBILE_SUFFIX:      '_1500x1500',
   THUMB_SUFFIX:       '_300x300',
   LARGE_THUMB_SUFFIX: '_600x600'
}

export const GroupUserState = {
   OWNER:      'Owner',
   MODERATOR:  'Moderator',
   MEMBER:     'Member',
   VIEWER:     'Viewer', // read-only
   INVITED:    'Invited',
}

export const ImageType = {
   PRIMARY:    'Primary',
   OTHER:      'Other',
   CROP:       'Crop',
   GALLERY:    'Gallery',
   GROUP:      'Group',
   HEADER:     'Header',
   BACKGROUND: 'Background',
   UPLOAD:     'Upload',
   USER:       'User',
}
export const GalleryImageTypes = [ ImageType.GALLERY, ImageType.HEADER, ImageType.BACKGROUND ]  

export const InviteState = {
   CREATED:  'Created',
   SENT:     'Sent',
   ACCEPTED: 'Accepted',
   ARCHIVED: 'Archived',
}

export const InviteType = {
   SITE:  'Site',
   GROUP: 'Group',
}

export const ItemNavAction = {
   EXTERNAL: 'ext',
   NEXT:     'next',
   PREV:     'prev',
}

export const ItemOrigin = {
   ADMIN:     'admin',
   ARTIST:    'artist',
   EXTERNAL:  'ext',
   FAVORITES: 'favorites',
   GALLERY:   'gallery',
   GROUP:     'group',
   INVISIBLE: 'invisible',
   RANDOM:    'random',
   RECENT:    'recent',
   SEARCH:    'search',
   VIEWED:    'viewed',
   WALL:      'wall',
}

export const ItemType = {
   SINGLE:  'Single',
   GROUP:   'Group',
}

export const ItemThumbOptions = { 
   TITLE:    'Title',
   ARTIST:   'Artist',
   YEAR:     'Year',
   UPDATED:  'Date Updated',
   USER:     'User',
}  

export const LogEntryType = {
   ERROR:   'Error',
   INFO:    'Info',
}

export const NotificationOptions = {
   IMMEDIATE: 'Immediate',
   DAILY:     'Daily', 
   NEVER:     'Never', 
}

export const DefaultUserSettings = { "notifyViaEmail": NotificationOptions.NEVER, "notifyViaMessage": NotificationOptions.NEVER }

export const Route = {
   HOME:      { name: 'home',      url: '/',          display: 'Home' },
   ABOUT:     { name: 'about',     url: '/about',     display: 'About' },
   ACCOUNT:   { name: 'account',   url: '/account',   display: 'My Account' },
   ADD_ITEM:  { name: 'add-item',  url: '/add-item',  display: 'Add Item' },
   ARTIST:    { name: 'artist',    url: '/artist/'    },
   BROADCAST: { name: 'broadcast', url: '/broadcast'  },
   EDIT_ITEM: { name: 'edit-item', url: '/edit-item/',display: 'Edit Item' },
   GALLERY:   { name: 'gallery',   url: '/gallery/'   },
   GALLERIES: { name: 'galleries', url: '/galleries/',display: 'Galleries' },
   GROUP:     { name: 'group',     url: '/group/'     },
   GROUP_CHAT:{ name: 'groupchat', url: '/group/'     },
   GROUPS:    { name: 'groups',    url: '/groups',    display: 'Groups' },
   FAVORITES: { name: 'favorites', url: '/favorites', display: 'My Favorites' },
   FORGOT:    { name: 'forgot',    url: '/forgot',    display: 'Forgot Password' },
   INVISIBLE: { name: 'invisible', url: '/invisible/',display: 'Invisible Items' },
   ITEM:      { name: 'item',      url: '/item/'      },
   ITEM_CHILD:{ name: 'itemch',    url: '/item/'      }, // overload item
   LOGIN:     { name: 'login',     url: '/login',     display: 'Login' },
   MESSAGE:   { name: 'message',   url: '/message',   display: 'Message' },
   RANDOM:    { name: 'random',    url: '/random'     },
   RECENT:    { name: 'recent',    url: '/recent/',   display: 'Updates' },
   REGISTER:  { name: 'register',  url: '/register/'  },
   SEARCH:    { name: 'search',    url: '/search',    display: 'Search'},
   USER:      { name: 'user',      url: '/user/'      },
   VIEWED:    { name: 'viewed',    url: '/viewed/',   display: 'Recent Viewed' } 
}

export const State = {
   PUBLIC:    'Public',
   PRIVATE:   'Private',
   GROUP:     'Group',   
   HIDDEN:    'Hidden',   
}
export const ItemStates    = [ State.PUBLIC, State.GROUP, State.PRIVATE, State.HIDDEN ]
export const BulkEditItemStates = [ State.PUBLIC, State.PRIVATE, State.HIDDEN ]
export const GalleryStates = [ State.PUBLIC, State.PRIVATE ]
export const GroupStates   = [ State.PUBLIC, State.PRIVATE, State.HIDDEN ]
export const ChatStates    = [ State.PUBLIC, State.GROUP, State.PRIVATE ]

export const ThumbHeights = { 
   sizes:  [150, 150, 200, 250, 300], 
   xsSizes:[125, 125, 150, 200] 
}
export const ThumbSize = { 
   IMG: 'Image', // small image only
   SM:  'Small',
   MED: 'Med',
   LG:  'Large',
   XL:  'XL',
}  

export const GalleryThumbMaxWidths = { // xs is % of width - 4/3/2 thumbs/row
   sizes:   new Map([ [ThumbSize.IMG, 150], [ThumbSize.SM, 150], [ThumbSize.MED, 200], [ThumbSize.LG, GalleryThumbWidth] ]),
   xsSizes: new Map([ [ThumbSize.IMG, .22], [ThumbSize.SM, .22], [ThumbSize.MED, .28],  [ThumbSize.LG, .45] ]) 
}

export const ItemMaxLandscapeWidths = { 
   sizes:   new Map([ [ThumbSize.IMG, 200], [ThumbSize.SM, 200], [ThumbSize.MED, 250], [ThumbSize.LG, Defaults.MAX_THUMB_SIDE] ]),
   xsSizes: new Map([ [ThumbSize.IMG, 125], [ThumbSize.SM, 125], [ThumbSize.MED, 175], [ThumbSize.LG, Defaults.MAX_THUMB_SIDE] ]) }

export const NotificationStatus = { 
   ACTIVE:     'Active', 
   INACTIVE:   'Inactive' 
}

export const NotificationType = {
   GROUP_ITEM: 'GroupItem',
   GROUP_CHAT: 'GroupChat'
}

export const ThumbType = {
   ITEM:       'Item',
   GALLERY:    'Gallery',
   GROUP:      'Group',
   RECENT:     'Recent',
   FEED:       'Feed',
}

export const ThumbAspectRatio = { 
   GALLERY:    16/9, 
   GROUP:      4/3, 
}  

export const TodoType = {
   INVITE:       'Invite',
   GROUP_INVITE: 'GroupInvite',
}
   
export const WallDisplayOrder = {
   USER_SET:  'User Set',
   RANDOM:    'Random',
}

export const WallImages = [ "/images/speakeasy.jpg", "/images/hell-no-sofia.jpg", "/images/hell-no-solo.jpg" ]

export const WallRowHeight = {
   DEFAULT: 320,
   XS:      250,
}

export const WallType = {
   SITE:  'Site',
   USER:  'User',
}

export const BackgroundColors = {
   GREEN:   { name: "green-lighten-5",  code: "#E8F5E9"},
   YELLOW:  { name: "yellow-lighten-4", code: "#FFF9C4"},
   RED:     { name: "red-lighten-4",    code: "#FFCDD2"},
   GREY:    { name: "grey-lighten-3",   code: "#EEEEEE"},
   WHITE:   { name: "white",            code: "#FFFFFF"},
}

export const Colors = [ 'red', 'pink', 'orange', 'yellow', 'blue', 'green', 'indigo', 'purple' ]
