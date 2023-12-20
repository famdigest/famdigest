import { WelcomeMessage, welcomeMessageText } from "./owner/welcome";
import {
  SubscriberFailedToOptIn,
  subscriberFailedToOptIn,
} from "./owner/opt-in-failed";
import {
  SubscriberOptInReminder,
  subscriberOptInReminder,
} from "./owner/opt-in-reminder";
import {
  SubscriberOptInConfirmation,
  subscriberOptInConfirmation,
} from "./owner/opt-in-confirmation";
import {
  ConnectionFailure,
  connectionFailure,
} from "./owner/connection-failure";
import {
  ConnectionFailureResolved,
  connectionFailureResolved,
} from "./owner/connection-resolved";
import { TrialEndingSoon, trialEndingSoon } from "./owner/end-of-trial";
import {
  ContactWelcomeMessage,
  contactWelcomeMessage,
} from "./subscriber/welcome";
import {
  ContactOptInReminder,
  contactOptInReminder,
} from "./subscriber/opt-in-reminder";
import {
  ContactOptInConfirmation,
  contactOptInConfirmation,
} from "./subscriber/opt-in-confirmation";
import {
  OwnerUnsubscribed,
  ownerUnsubscribed,
} from "./subscriber/owner-unsubscribed";

export const notificationsMap = {
  "owner.welcome": {
    subject: "Welcome to FamDigest",
    react: WelcomeMessage,
    text: welcomeMessageText,
  },
  "owner.subscriberFailedToOptIn": {
    subject: "Opt-In Status",
    react: SubscriberFailedToOptIn,
    text: subscriberFailedToOptIn,
  },
  "owner.subscriberOptInReminder": {
    subject: "Opt-In Reminder Sent",
    react: SubscriberOptInReminder,
    text: subscriberOptInReminder,
  },
  "owner.subscriberOptInConfirmation": {
    subject: "Opt-In Status",
    react: SubscriberOptInConfirmation,
    text: subscriberOptInConfirmation,
  },
  "owner.connectionFailure": {
    subject: "Calendar Sync Issue",
    react: ConnectionFailure,
    text: connectionFailure,
  },
  "owner.connectionFailureResolved": {
    subject: "Calendar Sync Issue Resolved",
    react: ConnectionFailureResolved,
    text: connectionFailureResolved,
  },
  "owner.trialEndingSoon": {
    subject: "Trial Ending Soon",
    react: TrialEndingSoon,
    text: trialEndingSoon,
  },

  "contact.welcomeMessage": {
    subject: "Welcome to FamDigest",
    react: ContactWelcomeMessage,
    text: contactWelcomeMessage,
  },
  "contact.optInReminder": {
    subject: "Reminder to Opt-In to FamDigest Daily Digest",
    react: ContactOptInReminder,
    text: contactOptInReminder,
  },
  "contact.optInConfirmation": {
    subject: "Welcome to FamDigest",
    react: ContactOptInConfirmation,
    text: contactOptInConfirmation,
  },
  "contact.ownerUnsubscribed": {
    subject: "Welcome to FamDigest",
    react: OwnerUnsubscribed,
    text: ownerUnsubscribed,
  },
};
