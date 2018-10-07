import 'webext-dynamic-content-scripts';
import ReactDOM from 'react-dom';
import React from 'react';
// import select from 'select-dom';
import domLoaded from 'dom-loaded';

// import * as pageDetect from './libs/page-detect';
import {safeElementReady, enableFeature, safeOnAjaxedPages} from './libs/utils';
import App from './libs/components/App';

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

async function onDomReady() {
	document.body.innerHTML = '';
	const container = document.createElement('div');
	container.className = 'vandal';
	const frame = document.createElement('iframe');
	frame.src = window.location.href;
	frame.className = 'frame';
	frame.setAttribute('frameborder', '0');

	document.body.appendChild(container);
	document.body.appendChild(frame);

	ReactDOM.render(<App/>, container);

	// enableFeature(markUnread);
	// enableFeature(addOpenAllNotificationsButton);
	// enableFeature(enableCopyOnY);
	// enableFeature(addProfileHotkey);
	// enableFeature(makeDiscussionSidebarSticky);
	// enableFeature(closeOutOfViewModals);
	// enableFeature(improveShortcutHelp);
	// enableFeature(addUploadBtn);

	// if (!pageDetect.isGist()) {
	// 	enableFeature(moveMarketplaceLinkToProfileDropdown);
	// 	enableFeature(addYourRepoLinkToProfileDropdown);
	// }

	// if (pageDetect.isGist()) {
	// 	enableFeature(addFileCopyButton);
	// }

	// if (pageDetect.isDashboard()) {
	// 	enableFeature(hideOwnStars);
	// 	enableFeature(autoLoadMoreNews);
	// }

	// // Push safeOnAjaxedPages on the next tick so it happens in the correct order
	// // (specifically for addOpenAllNotificationsButton)
	await Promise.resolve();

	// safeOnAjaxedPages(() => {
	// 	ajaxedPagesHandler();

	// 	// Mark current page as "done"
	// 	// so history.back() won't reapply the same changes
	// 	const ajaxContainer = select('#js-repo-pjax-container,#js-pjax-container');
	// 	if (ajaxContainer) {
	// 		ajaxContainer.append(<has-rgh/>);
	// 	}
	// });
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
