import 'webext-dynamic-content-scripts';
import ReactDOM from 'react-dom';
import React from 'react';
// import select from 'select-dom';
import domLoaded from 'dom-loaded';

// import * as pageDetect from './libs/page-detect';
import { safeElementReady } from './libs/utils';
import App from './libs/components/app';
import Drawer from './libs/components/drawer';

// Add globals for easier debugging
// window.select = select;

async function init() {
  await safeElementReady('body');

  // if (pageDetect.is404() || pageDetect.is500()) {
  // 	return;
  // }

  await domLoaded;
  console.log('Vandal in action');
  onDomReady();
}

let _app;

const archiveRegExp = /\/web\/\d+(?:im_)?\/(.*)/;

async function onDomReady() {
  document.body.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'vandal-box';
  const drawer = document.createElement('div');
  drawer.className = 'vandal-drawer';

  // use iframe.html as it's a web accessible resource
  /// to avoid blocked by client errors
  const baseURL = chrome.runtime.getURL('iframe.html');
  const frame = document.createElement('iframe');

  let url = new URL(window.location.href);
  if (url.host === 'web.archive.org' && archiveRegExp.test(url.pathname)) {
    let match = url.pathname.match(archiveRegExp)[1];
    try {
      url = new URL(match);
    } catch (e) {
      console.log('Failed to parse url');
    }
  }

  frame.id = frame.className = 'vandal-iframe';
  frame.setAttribute('frameborder', '0');

  const container = document.createElement('div');
  container.className = 'vandal';
  document.body.appendChild(container);
  container.appendChild(box);
  container.appendChild(frame);
  container.appendChild(drawer);

  ReactDOM.render(
    <App
      baseURL={baseURL}
      ref={_ref => (_app = _ref)}
      url={url.href}
      root={container}
      browser={frame}
    />,
    box
  );
  ReactDOM.render(<Drawer frame={frame} />, drawer);

  await Promise.resolve();
}

// eslint-disable-next-line complexity
// function ajaxedPagesHandler() {
// 	enableFeature(hideEmptyMeta);
// 	enableFeature(removeUploadFilesButton);
// 	enableFeature(addTitleToEmojis);
// 	enableFeature(shortenLinks);
// 	enableFeature(linkifyCode);
// 	enableFeature(addDownloadFolderButton);
// 	enableFeature(linkifyBranchRefs);
// 	enableFeature(openAllSelected);

// 	if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
// 		enableFeature(addYoursMenuItem);
// 		enableFeature(addCommentedMenuItem);
// 	}

// 	enableFeature(sortIssuesByUpdateTime); // Must be after addYoursMenuItem + addCommentedMenuItem

// 	if (pageDetect.isMilestone()) {
// 		enableFeature(addMilestoneNavigation); // Needs to be before sortMilestonesByClosestDueDate
// 	}

// 	if (pageDetect.isRepo()) {
// 		enableFeature(addReadmeButtons);
// 		enableFeature(addBranchButtons);
// 		enableFeature(addDiffViewWithoutWhitespaceOption);
// 		enableFeature(removeDiffSigns);
// 		enableFeature(addCILink);
// 		enableFeature(sortMilestonesByClosestDueDate); // Needs to be after addMilestoneNavigation
// 	}

// 	if (pageDetect.isRepoRoot()) {
// 		enableFeature(addToggleFilesButton);
// 	}

// 	if (pageDetect.isPR()) {
// 		enableFeature(scrollToTopOnCollapse);
// 		enableFeature(addDeleteForkLink);
// 		enableFeature(fixSquashAndMergeTitle);
// 		enableFeature(fixSquashAndMergeMessage);
// 		enableFeature(openCIDetailsInNewTab);
// 		enableFeature(waitForBuild);
// 		enableFeature(toggleAllThingsWithAlt);
// 		enableFeature(hideInactiveDeployments);
// 		enableFeature(addPullRequestHotkey);
// 	}

// 	if (pageDetect.isPR() || pageDetect.isIssue()) {
// 		enableFeature(linkifyIssuesInTitles);
// 		enableFeature(embedGistInline);
// 		enableFeature(extendStatusLabels);
// 		enableFeature(highlightClosingPrsInOpenIssues);

// 		observeEl('.new-discussion-timeline', () => {
// 			enableFeature(addOPLabels);
// 			enableFeature(addTimeMachineLinksToComments);
// 		});
// 	}

// 	if (pageDetect.isNewIssue()) {
// 		enableFeature(displayIssueSuggestions);
// 	}

// 	if (pageDetect.isIssue() || pageDetect.isPRConversation()) {
// 		enableFeature(addJumpToBottomLink);
// 	}

// 	if (pageDetect.isIssueList()) {
// 		enableFeature(addFilterCommentsByYou);
// 		enableFeature(hideIssueListAutocomplete);
// 	}

// 	if (pageDetect.isIssueList() || pageDetect.isPR() || pageDetect.isIssue()) {
// 		enableFeature(showRecentlyPushedBranches);
// 	}

// 	if (pageDetect.isReleasesOrTags()) {
// 		enableFeature(addCreateReleaseShortcut);
// 	}

// 	if (pageDetect.isCommit()) {
// 		enableFeature(addPatchDiffLinks);
// 		enableFeature(toggleAllThingsWithAlt);
// 	}

// 	if (pageDetect.isCompare()) {
// 		enableFeature(toggleAllThingsWithAlt);
// 		enableFeature(addSwapBranchesOnCompare);
// 	}

// 	if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit() || pageDetect.isDiscussion()) {
// 		enableFeature(addReactionParticipants);
// 		enableFeature(showRealNames);
// 	}

// 	if (pageDetect.isCommitList()) {
// 		enableFeature(markMergeCommitsInList);
// 	}

// 	if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
// 		enableFeature(addCopyFilePathToPRs);
// 		enableFeature(addPrevNextButtonsToPRs);
// 		enableFeature(preserveWhitespaceOptionInNav);
// 		enableFeature(addQuickReviewButtons);
// 	}

// 	if (pageDetect.isPRFiles()) {
// 		enableFeature(extendDiffExpander);
// 		enableFeature(addDeleteToPrFiles);
// 	}

// 	if (pageDetect.isSingleFile()) {
// 		enableFeature(addFileCopyButton);
// 	}

// 	if (pageDetect.isUserProfile()) {
// 		enableFeature(addGistsLink);
// 		enableFeature(showFollowersYouKnow);
// 	}

// 	if (pageDetect.isPRCommit()) {
// 		enableFeature(linkifyCommitSha);
// 	}
// }

init();
