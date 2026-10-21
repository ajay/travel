################################################################################

# Copied from build-tools git.mk reference implementation.
# https://github.com/ajay/build-tools/blob/main/makefiles/git.mk
# Keep in sync with the reference when updating.

REPO_ROOT := $(shell git rev-parse --show-toplevel)

git-submodule-update:
	@## initialize and update git submodules
	git submodule sync --recursive
	git submodule update --init --recursive

ifneq ($(MAKECMDGOALS),git-submodule-update)
ifneq (,$(shell git submodule status --recursive 2>/dev/null | grep '^[-+]'))
$(error ERROR: git submodules not initialized or out of date; run `make git-submodule-update`)
endif
endif

################################################################################

-include $(REPO_ROOT)/site-common/makefiles/site.mk

################################################################################

CHROME ?= google-chrome
CHROME_FLAGS ?=
SCREENSHOT_PORT ?= 8799

.PHONY: screenshot

screenshot:
	@## regenerate screenshot.png from the local site (needs Chrome)
	$(Q) $(PYTHON) -m http.server $(SCREENSHOT_PORT) --bind 127.0.0.1 --directory $(REPO_ROOT) >/dev/null 2>&1 & \
	srv=$$!; prof=$$(mktemp -d); trap 'kill $$srv; rm -rf "$$prof"' EXIT; sleep 1; \
	"$(CHROME)" --headless=new --no-first-run --no-default-browser-check --user-data-dir="$$prof" \
		--log-level=3 --disable-breakpad --hide-scrollbars --window-size=1440,900 --force-device-scale-factor=2 \
		--virtual-time-budget=10000 $(CHROME_FLAGS) --screenshot=$(REPO_ROOT)/screenshot.png \
		http://127.0.0.1:$(SCREENSHOT_PORT)/

################################################################################
