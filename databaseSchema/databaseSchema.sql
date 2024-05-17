CREATE TABLE `users_auth` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(45) NOT NULL,
  `status` varchar(45) NOT NULL,
  `active_pin` varchar(45) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pass_updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
);

CREATE TABLE `user_login_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_email` VARCHAR(245) NULL,
  `password` VARCHAR(245) NULL,
  `ipAddress` VARCHAR(45) NULL DEFAULT NULL,
  `islogged` TINYINT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `countries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text
  PRIMARY KEY (`id`)
);

CREATE TABLE `states` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text,
  `country_id` int DEFAULT NULL
  PRIMARY KEY (`id`),
  KEY `fk_states_1_idx` (`id`),
  KEY `fk_states_1_idx1` (`country_id`),
  CONSTRAINT `fk_states_1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`)
);

CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text,
  `state_id` int DEFAULT NULL,
  `country_id` int DEFAULT NULL
  PRIMARY KEY (`id`),
  KEY `fk_cities_1_idx` (`state_id`)
);

create table user_profiles (
  id int not null auto_increment primary key,
  user_id int not null,
  first_name varchar(255) not null,
  last_name varchar(255) not null,
  username varchar(255) not null,
  user_bio varchar(255),
  user_dob date not null,
  city_id int not null,
  gender varchar(255) not null,
  profile_image varchar(255),
  create_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  update_at timestamp NULL on update CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users_auth(id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

create table user_interests (
  id int not null primary key auto_increment,
  user_id int not null,
  interests varchar(255),
  FOREIGN KEY (user_id) REFERENCES users_auth(id)
);

CREATE TABLE `trip_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `trip_details` (
  `trip_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `discription` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `trip_type_id` int NOT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`trip_id`),
  KEY `user_id` (`user_id`),
  KEY `trip_type_id` (`trip_type_id`),
  KEY `trip_details_ibfk_3_idx` (`deleted_by`),
  CONSTRAINT `trip_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users_auth` (`id`),
  CONSTRAINT `trip_details_ibfk_2` FOREIGN KEY (`trip_type_id`) REFERENCES `trip_types` (`id`),
  CONSTRAINT `trip_details_ibfk_3` FOREIGN KEY (`deleted_by`) REFERENCES `users_auth` (`id`)
);

CREATE TABLE `trip_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `user_id` int NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `trip_id` (`trip_id`),
  KEY `trip_members_ibfk_3_idx` (`deleted_by`),
  CONSTRAINT `trip_members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users_auth` (`id`),
  CONSTRAINT `trip_members_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trip_details` (`trip_id`),
  CONSTRAINT `trip_members_ibfk_3` FOREIGN KEY (`deleted_by`) REFERENCES `users_auth` (`id`)
);

CREATE TABLE `trip_days` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `discription` longtext,
  `title` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `dates` date DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  KEY `fk_trip_days_1` (`deleted_by`),
  CONSTRAINT `fk_trip_days_1` FOREIGN KEY (`deleted_by`) REFERENCES `triptale`.`users_auth` (`id`),
  CONSTRAINT `trip_days_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trip_details` (`trip_id`)
);

CREATE TABLE `trip_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` varchar(255) DEFAULT NULL,
  `day_id` int NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `is_video` TINYINT,
  PRIMARY KEY (`id`),
  KEY `day_id` (`day_id`),
  KEY `trip_images_ibfk_2_idx` (`deleted_by`),
  CONSTRAINT `trip_images_ibfk_1` FOREIGN KEY (`day_id`) REFERENCES `trip_days` (`id`),
  CONSTRAINT `trip_images_ibfk_2` FOREIGN KEY (`deleted_by`) REFERENCES `users_auth` (`id`)
);

CREATE TABLE `trip_chats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` LONGTEXT NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (utc_timestamp()),
  PRIMARY KEY (`id`)
);

CREATE TABLE `privacy` (
  `id` int NOT NULL AUTO_INCREMENT,
  `privacy` varchar(255) DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `location` varchar(255) NOT NULL DEFAULT NULL,
  `privacy_id` int NOT NULL,
  `like_count` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  `ismultiple` int DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT (utc_timestamp()),
  `update_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `caption` varchar(255) DEFAULT NULL,
  `descriptions` LONGTEXT DEFAULT NULL,
  `isdeleted` timestamp NULL DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `privacy_id` (`privacy_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_profiles` (`user_id`),
  CONSTRAINT `posts_ibfk_3` FOREIGN KEY (`privacy_id`) REFERENCES `privacy` (`id`)
);

CREATE TABLE `post_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `isvideo` INT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `post_images_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
);

CREATE TABLE `hashtags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `post_hashtags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `tag` int DEFAULT NULL,
  `isdeleted` timestamp NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `index4` (`post_id`, `tag`),
  KEY `post_id` (`post_id`),
  KEY `fk_post_tags_1_idx` (`tag`),
  CONSTRAINT `fk_post_tags_1` FOREIGN KEY (`tag`) REFERENCES `hashtags` (`id`),
  CONSTRAINT `post_hashtags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
);

CREATE TABLE `post_people_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `isdeleted` timestamp NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `index2` (`user_id`, `post_id`),
  CONSTRAINT `fk_post_people_tags_1` FOREIGN KEY (`user_id`) REFERENCES `users_auth` (`id`),
  CONSTRAINT `post_people_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)

);

CREATE TABLE `post_comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `comment_by` int NOT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comment_by` (`comment_by`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `post_comment_ibfk_1` FOREIGN KEY (`comment_by`) REFERENCES `users_auth` (`id`),
  CONSTRAINT `post_comment_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
);

CREATE TABLE `post_likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `liked_by` int NOT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `isdeleted` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index4` (`post_id`, `liked_by`),
  KEY `liked_by` (`liked_by`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`liked_by`) REFERENCES `users_auth` (`id`),
  CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
);

create table albums(
  id int not null primary key auto_increment,
  user_id int not null,
  albums_name varchar(255),
  create_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users_auth(id)
);

create table albums_post(
  id int not null primary key auto_increment,
  album_id int not null,
  post_id int not null,
  foreign key (album_id) references albums(id),
  foreign key (post_id) references posts(id)
);

CREATE TABLE IF NOT EXISTS `notification` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `post_id` INT NOT NULL,
  `like_by` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` VARCHAR(45) NULL DEFAULT NULL,
  `create_at` TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `notification_trip` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `trip_id` VARCHAR(45) NOT NULL,
  `create_user_id` VARCHAR(45) NOT NULL,
  `add_user_id` VARCHAR(45) NOT NULL,
  `create_at` TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
);

CREATE TABLE `trip_post_location` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

create table `search_history`(
  `id` int auto_increment primary key,
  `user_id` int,
  `search` varchar(255)
);

CREATE TABLE `comment_reply` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment_id` int NOT NULL,
  `reply_comment` varchar(255) NOT NULL,
  `reply_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comment_reply_1_idx` (`comment_id`),
  KEY `fk_comment_reply_2_idx` (`reply_by`),
  CONSTRAINT `fk_comment_reply_1` FOREIGN KEY (`comment_id`) REFERENCES `post_comment` (`id`),
  CONSTRAINT `fk_comment_reply_2` FOREIGN KEY (`reply_by`) REFERENCES `user_profiles` (`user_id`)
);

CREATE TABLE `trip_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int DEFAULT NULL,
  `title` varchar(45) DEFAULT NULL,
  `discription` varchar(45) DEFAULT NULL,
  `image` varchar(100) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_trip_events_1_idx` (`trip_id`),
  KEY `fk_trip_events_2_idx` (`created_by`),
  CONSTRAINT `fk_trip_events_1` FOREIGN KEY (`trip_id`) REFERENCES `trip_details` (`trip_id`),
  CONSTRAINT `fk_trip_events_2` FOREIGN KEY (`created_by`) REFERENCES `users_auth` (`id`)
);