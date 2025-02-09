<template>
    <svg class="mw-svg-calendar" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="34" height="34" stroke="transparent" fill="transparent" />

        <!-- The rest of the icon -->
        <!-- The calendar bounds -->
        <rect x="0.5" y="0.5" width="33" height="33" class="calendar-bounds" />
        <!-- The "Month" letters -->
        <path class="month-letter" d="M5.16892 3.25707L6.28416 6.65039L7.39344 3.25707H8.56832V7.93573H7.67076V6.65681L7.76022 4.44923L6.58832 7.93573H5.97404L4.80512 4.45244L4.89458 6.65681V7.93573H4V3.25707H5.16892Z" />
        <path class="month-letter" d="M9.15874 6.16517C9.15874 5.82027 9.22037 5.51285 9.34362 5.24293C9.46688 4.97301 9.64381 4.76414 9.87441 4.61632C10.107 4.46851 10.3764 4.3946 10.6825 4.3946C11.1179 4.3946 11.4727 4.53813 11.7471 4.82519C12.0234 5.11225 12.1775 5.50214 12.2093 5.99486L12.2152 6.23265C12.2152 6.76607 12.0771 7.19452 11.8007 7.51799C11.5244 7.83933 11.1537 8 10.6885 8C10.2233 8 9.85155 7.83933 9.57323 7.51799C9.29691 7.19666 9.15874 6.75964 9.15874 6.20694V6.16517ZM10.0205 6.23265C10.0205 6.56255 10.0782 6.81534 10.1935 6.991C10.3088 7.16452 10.4738 7.25129 10.6885 7.25129C10.8972 7.25129 11.0602 7.1656 11.1775 6.99422C11.2948 6.82069 11.3534 6.54434 11.3534 6.16517C11.3534 5.84169 11.2948 5.59105 11.1775 5.41324C11.0602 5.23543 10.8952 5.14653 10.6825 5.14653C10.4718 5.14653 10.3088 5.23543 10.1935 5.41324C10.0782 5.5889 10.0205 5.86204 10.0205 6.23265Z" />
        <path class="month-letter" d="M13.5392 4.45887L13.566 4.86054C13.7966 4.54991 14.1058 4.3946 14.4934 4.3946C14.8354 4.3946 15.0898 4.50278 15.2568 4.71915C15.4238 4.93552 15.5093 5.259 15.5132 5.68959V7.93573H14.6515V5.71208C14.6515 5.515 14.6117 5.37254 14.5322 5.2847C14.4527 5.19473 14.3205 5.14974 14.1356 5.14974C13.8931 5.14974 13.7112 5.26114 13.5899 5.48393V7.93573H12.7281V4.45887H13.5392Z" />
        <path class="month-letter" d="M17.201 3.60411V4.45887H17.7527V5.1401H17.201V6.87532C17.201 7.00386 17.2239 7.09597 17.2696 7.15167C17.3153 7.20737 17.4028 7.23522 17.532 7.23522C17.6274 7.23522 17.7119 7.22772 17.7855 7.21272V7.91645C17.6165 7.97215 17.4426 8 17.2636 8C16.6593 8 16.3512 7.67117 16.3392 7.0135V5.1401H15.8681V4.45887H16.3392V3.60411H17.201Z" />
        <path class="month-letter" d="M19.0737 4.83805C19.3023 4.54242 19.5895 4.3946 19.9355 4.3946C20.6352 4.3946 20.9901 4.83269 21 5.70887V7.93573H20.1382V5.73458C20.1382 5.53535 20.0985 5.3886 20.0189 5.29434C19.9394 5.19794 19.8072 5.14974 19.6223 5.14974C19.3699 5.14974 19.187 5.25471 19.0737 5.46465V7.93573H18.2119V3H19.0737V4.83805Z" />
        <!-- The month underline -->
        <rect x="3" y="9" width="28" height="1" class="month-underline" />
        <!-- All the days! -->
        <rect x="4" y="28" width="2" height="2" class="calendar-day" />
        <rect x="8" y="28" width="2" height="2" class="calendar-day" />
        <rect x="12" y="28" width="2" height="2" class="calendar-day" />
        <rect x="16" y="28" width="2" height="2" class="calendar-day" />
        <rect x="20" y="28" width="2" height="2" class="calendar-day" />
        <rect x="4" y="24" width="2" height="2" class="calendar-day" />
        <rect x="8" y="24" width="2" height="2" class="calendar-day" />
        <rect x="12" y="24" width="2" height="2" class="calendar-day" />
        <rect x="16" y="24" width="2" height="2" class="calendar-day" />
        <rect x="20" y="24" width="2" height="2" class="calendar-day" />
        <rect x="24" y="24" width="2" height="2" class="calendar-day" />
        <rect x="28" y="24" width="2" height="2" class="calendar-day" />
        <rect x="4" y="20" width="2" height="2" class="calendar-day" />
        <rect x="8" y="20" width="2" height="2" class="calendar-day" />
        <rect x="12" y="20" width="2" height="2" class="calendar-day" />
        <rect x="16" y="20" width="2" height="2" class="calendar-day" />
        <rect x="20" y="20" width="2" height="2" class="calendar-day" />
        <rect x="24" y="20" width="2" height="2" class="calendar-day" />
        <rect x="28" y="20" width="2" height="2" class="calendar-day" />
        <rect x="4" y="16" width="2" height="2" class="calendar-day" />
        <rect x="8" y="16" width="2" height="2" class="calendar-day" />
        <rect x="12" y="16" width="2" height="2" class="calendar-day" />
        <rect x="16" y="16" width="2" height="2" class="calendar-day" />
        <rect x="20" y="16" width="2" height="2" class="calendar-day" />
        <rect x="24" y="16" width="2" height="2" class="calendar-day" />
        <rect x="28" y="16" width="2" height="2" class="calendar-day" />
        <rect x="12" y="12" width="2" height="2" class="calendar-day" />
        <rect x="16" y="12" width="2" height="2" class="calendar-day" />
        <rect x="20" y="12" width="2" height="2" class="calendar-day" />
        <rect x="24" y="12" width="2" height="2" class="calendar-day" />
        <rect x="28" y="12" width="2" height="2" class="calendar-day" />

    </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup() {
        return {}
    },
})
</script>

<style lang="css">

.mw-svg-calendar {
    .calendar-bounds { fill: var(--gray3); stroke: var(--gray3); }
    .month-letter    { fill: var(--gray-very-dark);  stroke: none; }
    .month-underline { fill: var(--gray-very-dark);  stroke: none; }
    .calendar-day    { fill: var(--gray-very-dark);  stroke: none; }

    &.active {
        .calendar-bounds { fill: var(--gray7); stroke: var(--gray7); }
    }
}

</style>