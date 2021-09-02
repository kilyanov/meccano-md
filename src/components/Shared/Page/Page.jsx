import React, { useCallback } from 'react';
import TopBar from '../TopBar/TopBar';
import './page.scss';
import { Box, Typography, Button } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import clsx from 'clsx';
import { pageStyles } from './styles';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useHistory } from 'react-router-dom';
// import Bread from '../Bread';

const Page = ({
    title,
    className,
    withBar,
    staticBar,
    withBackButton,
    children
}) => {
    const classes = pageStyles();

    const history = useHistory();

    const handleClickBackButton = useCallback(() => {
        history.goBack();
    }, []);

    return (
        <Container
            maxWidth={false}
            className={clsx({
                [classes.container]: 1,
                [classes.withBar]: withBar && !staticBar
            })}
        >
            {withBar && <TopBar isStatic={staticBar} />}

            <Box
                className={clsx({
                    [classes.content]: 1,
                    [className]: !!className
                })}
            >
                {title && (
                    <Box className={classes.header}>
                        {withBackButton && (
                            <Button
                                className={classes.backButton}
                                startIcon={<ArrowBackIosIcon />}
                                onClick={handleClickBackButton}
                                color='primary'
                            >
                                Назад
                            </Button>
                        )}
                        <Typography
                            className={classes.title}
                            variant='h1'
                        >
                            {title}
                        </Typography>
                    </Box>
                )}

                {children}
            </Box>
        </Container>
    );
};

export default Page;

// class Page extends Component {
//     static propTypes = {
//         title: PropTypes.string,
//         className: PropTypes.string,
//         children: PropTypes.node,
//         withBar: PropTypes.bool,
//         staticBar: PropTypes.bool,
//         withContainerClass: PropTypes.bool,
//         notificationsPanel: PropTypes.object
//     };
//
//     static defaultProps = {
//         withContainerClass: true
//     };
//
//     render() {
//         const {className, children, withBar, staticBar, withContainerClass, notificationsPanel, title} = this.props;
//
//         return (
//             <div {...cls('', {'with-bar': withBar && !staticBar, blur: notificationsPanel.open})}>
//                 {withBar && <TopBar isStatic={staticBar}/>}
//
//                 <div
//                     {...cls('content', '', {
//                         container: withContainerClass,
//                         [className]: !!className
//                     })}
//                 >
//                     {title && (
//                         <Box mb={2}>
//                             <Typography variant='h1' {...cls('title')}>{title}</Typography>
//                         </Box>
//                     )}
//                     {children}
//                 </div>
//             </div>
//         );
//     }
// }
//
// export default connect(({notificationsPanel}) => ({notificationsPanel}))(Page);
